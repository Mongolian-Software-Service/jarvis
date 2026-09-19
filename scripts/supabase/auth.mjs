/**
 * Everything about *who may sign in and where they may be sent back to*.
 *
 * Its own module because the setup script had grown past the one-screen rule
 * (§3.1) holding both the plumbing and the policy — and this half is the one
 * that gets read, argued about and corrected.
 *
 * Takes `api` rather than importing it: the caller already built an
 * authenticated client, and a second one here would be a second place the
 * token is read.
 */
export async function configureAuth(api, ref, { appUrl, googleId, googleSecret }) {
  /*
   * Never downgrade a live site back to localhost.
   *
   * `site_url` is the address Supabase falls back to for any redirect it will
   * not allow, and the base of every email link. Running this script without
   * `APP_URL` used to overwrite a deployed URL with `http://localhost:3001` —
   * silently, in one line of output nobody reads — and the next person to sign
   * in on a phone got Safari saying it could not reach a server. It happened
   * once; that is what this guard is.
   *
   * So an absent `APP_URL` means *leave it alone* when what is there is
   * already a real site. Only a project that has never been deployed gets the
   * localhost default.
   */
  const live = await api(`/projects/${ref}/config/auth`);
  const keepSiteUrl = !appUrl && /^https:\/\//.test(live.site_url ?? "");
  const siteUrl = appUrl || (keepSiteUrl ? live.site_url : "http://localhost:3001");

  /*
   * Every URL Supabase is allowed to send somebody back to.
   *
   * A redirect that is not on this list is **not** refused with an error — it
   * is silently replaced by `site_url`. Worth knowing, because the failure then
   * looks like the *site* being broken rather than the list being short: on a
   * phone it arrives as Safari saying it cannot reach localhost.
   *
   * **Supabase rejects any redirect whose host is an IP address**, and no
   * allowlist entry changes that — an exact literal is refused too. Tested:
   *
   *   exp://localhost:8081/--/auth/callback              accepted
   *   exp://myhost:8081/--/auth/callback                 accepted
   *   exp://ab.anonymous.8081.exp.direct/--/auth/callback accepted
   *   exp://192.168.0.178:8081/--/auth/callback          REFUSED
   *
   * That last one is what Expo Go hands out on a *physical* device over the
   * LAN, which is why Google sign-in on a real phone bounced to localhost while
   * the simulator was fine. There is no entry that fixes it. Run Expo with
   * `--tunnel` on hardware and the host becomes `*.exp.direct`, a real name.
   */
  const redirects = [
    "http://localhost:3000/auth/confirm",
    "http://localhost:3001/auth/confirm",
    // The installed build. Matches `scheme` in apps/mobile/app.json.
    "tsstark://**",
    // Expo Go: `exp://**` covers the simulator, `*.exp.direct` a real device
    // started with `--tunnel`. A LAN IP cannot be covered at all — see above.
    "exp://**",
    "exp://*.exp.direct/**",
    // Follows `siteUrl`, not `appUrl`: a run without APP_URL keeps the live
    // site's own callback on the list rather than quietly dropping it.
    ...(siteUrl.startsWith("https://") ? [`${siteUrl}/auth/confirm`] : []),
  ];

  const config = {
    site_url: siteUrl,
    uri_allow_list: redirects.join(","),
    // Off while developing: an account is usable the moment it is created.
    // Turn it back on before real students arrive.
    mailer_autoconfirm: true,
    /*
     * The same eight `signUpSchema` asks for, said again where it is enforced.
     *
     * Supabase ships a minimum of six. The form refuses seven characters and
     * the database would have accepted them — so anything not going through the
     * form (the phone, a REST client, a future screen) could set a password
     * weaker than the one the student was told was required. A rule that lives
     * only in the form is a rule that holds only for people using the form.
     */
    password_min_length: 8,
  };

  if (googleId && googleSecret) {
    config.external_google_enabled = true;
    config.external_google_client_id = googleId;
    config.external_google_secret = googleSecret;
  }

  await api(`/projects/${ref}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify(config),
  });

  console.log(`  site url        ${config.site_url}`);
  console.log(`  redirect urls   ${redirects.length} entries`);
  console.log(
    `  google          ${googleId && googleSecret ? "enabled" : "skipped (no GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)"}\n`,
  );
}
