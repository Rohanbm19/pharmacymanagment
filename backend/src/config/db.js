require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured");
}

const isSupabaseSecretKey = supabaseServiceRoleKey.startsWith("sb_secret_");
let hasLegacyServiceRoleKey = false;

if (!isSupabaseSecretKey) {
    try {
        const payload = supabaseServiceRoleKey.split(".")[1];
        const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
        hasLegacyServiceRoleKey = claims.role === "service_role";
    } catch {
        hasLegacyServiceRoleKey = false;
    }
}

if (!isSupabaseSecretKey && !hasLegacyServiceRoleKey) {
    throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY must be a Supabase secret key (sb_secret_...) or a legacy service_role JWT. A publishable/anon key cannot access tables protected by RLS."
    );
}

module.exports = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});