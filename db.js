(function () {
  "use strict";

  var config = typeof AppConfig !== "undefined" && AppConfig ? AppConfig : {};
  var databaseConfig = config.database || {};
  var supabaseClient = null;
  var currentProfile = null;

  function isConfigured() {
    return !!(
      window.supabase &&
      typeof window.supabase.createClient === "function" &&
      databaseConfig.supabaseUrl &&
      databaseConfig.supabasePublishableKey
    );
  }

  function getAuthState() {
    if (!window.luminaAuth || typeof window.luminaAuth.getState !== "function") {
      return null;
    }

    return window.luminaAuth.getState();
  }

  async function getAccessToken() {
    if (!window.luminaAuth || typeof window.luminaAuth.getToken !== "function") {
      return null;
    }

    try {
      return await window.luminaAuth.getToken();
    } catch (error) {
      console.warn("Failed to obtain Clerk token for Supabase", error);
      return null;
    }
  }

  function getClient() {
    if (!isConfigured()) {
      return null;
    }

    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(
        databaseConfig.supabaseUrl,
        databaseConfig.supabasePublishableKey,
        {
          accessToken: getAccessToken,
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
          }
        }
      );
    }

    return supabaseClient;
  }

  async function runAsAuthenticated(operation) {
    var authState = getAuthState();
    var client = getClient();

    if (!authState || !authState.isAuthenticated || !authState.user || !client) {
      return null;
    }

    return operation(client, authState.user);
  }

  async function syncCurrentUserProfile() {
    return runAsAuthenticated(async function (client, user) {
      var existingResponse = await client
        .from("app_users")
        .select("*")
        .eq("clerk_user_id", user.id)
        .maybeSingle();
      var payload = {
        clerk_user_id: user.id,
        email: user.email || "",
        full_name: user.name || "",
        avatar_url: user.avatarUrl || ""
      };
      var response = null;

      if (existingResponse.error) {
        throw existingResponse.error;
      }

      if (existingResponse.data) {
        response = await client
          .from("app_users")
          .update({
            email: payload.email,
            full_name: payload.full_name,
            avatar_url: payload.avatar_url
          })
          .eq("clerk_user_id", user.id)
          .select("*")
          .single();
      } else {
        response = await client
          .from("app_users")
          .insert({
            clerk_user_id: payload.clerk_user_id,
            email: payload.email,
            full_name: payload.full_name,
            avatar_url: payload.avatar_url,
            plan: "free",
            daily_limit: 2,
            beta_unlocked: false
          })
          .select("*")
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      currentProfile = response.data || null;
      return currentProfile;
    });
  }

  async function loadProjectSnapshot(mediaKey) {
    return runAsAuthenticated(async function (client, user) {
      if (!mediaKey) {
        return null;
      }

      var response = await client
        .from("projects")
        .select(
          "id, media_key, file_name, file_size_bytes, duration_text, resolution_text, flag_count, last_opened_at, markers(flag_id, time_seconds, zone, x_ratio, y_ratio, platform_key, comment, created_at)"
        )
        .eq("clerk_user_id", user.id)
        .eq("media_key", mediaKey)
        .maybeSingle();

      if (response.error) {
        throw response.error;
      }

      return normalizeProjectEntry(response.data);
    });
  }

  async function loadHistoryEntries() {
    return runAsAuthenticated(async function (client, user) {
      var response = await client
        .from("projects")
        .select(
          "id, media_key, file_name, file_size_bytes, duration_text, resolution_text, flag_count, last_opened_at, markers(flag_id, time_seconds, zone, x_ratio, y_ratio, platform_key, comment, created_at)"
        )
        .eq("clerk_user_id", user.id)
        .order("last_opened_at", { ascending: false });

      if (response.error) {
        throw response.error;
      }

      return (response.data || []).map(normalizeProjectEntry).filter(function (entry) {
        return entry && entry.flags && entry.flags.length > 0;
      });
    });
  }

  async function saveProjectSnapshot(snapshot) {
    return runAsAuthenticated(async function (client, user) {
      var projectPayload = null;
      var projectResponse = null;
      var deleteResponse = null;
      var markerPayload = [];
      var insertResponse = null;

      if (!snapshot || !snapshot.mediaKey) {
        return null;
      }

      await syncCurrentUserProfile();

      if (!Array.isArray(snapshot.flags) || !snapshot.flags.length) {
        deleteResponse = await client
          .from("projects")
          .delete()
          .eq("clerk_user_id", user.id)
          .eq("media_key", snapshot.mediaKey);

        if (deleteResponse.error) {
          throw deleteResponse.error;
        }

        return { projectId: null, deleted: true };
      }

      projectPayload = {
        clerk_user_id: user.id,
        media_key: snapshot.mediaKey,
        file_name: snapshot.fileName || "未命名素材",
        file_size_bytes: snapshot.fileSizeBytes || 0,
        duration_text: snapshot.durationText || "00:00",
        resolution_text: snapshot.resolutionText || "-- × --",
        flag_count: snapshot.flags.length,
        last_opened_at: new Date().toISOString()
      };

      projectResponse = await client
        .from("projects")
        .upsert(projectPayload, { onConflict: "clerk_user_id,media_key" })
        .select("id")
        .single();

      if (projectResponse.error) {
        throw projectResponse.error;
      }

      deleteResponse = await client
        .from("markers")
        .delete()
        .eq("project_id", projectResponse.data.id);

      if (deleteResponse.error) {
        throw deleteResponse.error;
      }

      markerPayload = snapshot.flags.map(function (flag) {
        return {
          project_id: projectResponse.data.id,
          clerk_user_id: user.id,
          flag_id: flag.id,
          time_seconds: flag.time,
          zone: flag.zone,
          x_ratio: flag.x,
          y_ratio: flag.y,
          platform_key: flag.platform,
          comment: flag.comment || ""
        };
      });

      insertResponse = await client.from("markers").insert(markerPayload);

      if (insertResponse.error) {
        throw insertResponse.error;
      }

      return { projectId: projectResponse.data.id, deleted: false };
    });
  }

  async function recordPdfExport(payload) {
    return runAsAuthenticated(async function (client, user) {
      var response = null;
      var usageResponse = null;
      var projectId = payload && payload.projectId ? payload.projectId : null;
      var exportPayload = {
        clerk_user_id: user.id,
        project_id: projectId,
        report_type: payload.reportType,
        export_file_name: payload.exportFileName,
        marker_count: payload.markerCount || 0,
        project_count: payload.projectCount || 1,
        meta: payload.meta || {}
      };

      await syncCurrentUserProfile();

      response = await client.from("pdf_exports").insert(exportPayload);

      if (response.error) {
        throw response.error;
      }

      usageResponse = await client.from("usage_events").insert({
        clerk_user_id: user.id,
        project_id: projectId,
        event_type: "pdf_export",
        meta: payload.meta || {}
      });

      if (usageResponse.error) {
        throw usageResponse.error;
      }

      return true;
    });
  }

  async function getPdfExportsTodayCount() {
    return runAsAuthenticated(async function (client) {
      var response = await client.rpc("current_user_pdf_exports_today");

      if (response.error) {
        throw response.error;
      }

      return response.data || 0;
    });
  }

  function normalizeProjectEntry(project) {
    if (!project || !project.media_key) {
      return null;
    }

    return {
      projectId: project.id,
      mediaKey: project.media_key,
      fileName: project.file_name || "未命名素材",
      fileSize: project.file_size_bytes || 0,
      durationText: project.duration_text || "00:00",
      resolutionText: project.resolution_text || "-- × --",
      lastOpened: project.last_opened_at ? Date.parse(project.last_opened_at) : Date.now(),
      flags: normalizeMarkers(project.markers || [])
    };
  }

  function normalizeMarkers(rows) {
    return rows.map(function (marker) {
      return {
        id: marker.flag_id,
        kind: "point",
        time: Number(marker.time_seconds) || 0,
        zone: marker.zone || "center",
        x: Number(marker.x_ratio) || 0,
        y: Number(marker.y_ratio) || 0,
        platform: marker.platform_key || "all",
        comment: marker.comment || "",
        createdAt: marker.created_at ? Date.parse(marker.created_at) : Date.now()
      };
    }).sort(function (left, right) {
      return left.time - right.time;
    });
  }

  window.luminaDb = {
    isConfigured: isConfigured,
    getClient: getClient,
    getCurrentProfile: function () {
      return currentProfile;
    },
    syncCurrentUserProfile: syncCurrentUserProfile,
    loadProjectSnapshot: loadProjectSnapshot,
    loadHistoryEntries: loadHistoryEntries,
    saveProjectSnapshot: saveProjectSnapshot,
    recordPdfExport: recordPdfExport,
    getPdfExportsTodayCount: getPdfExportsTodayCount
  };
})();
