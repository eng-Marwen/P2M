const GOOGLE_SIZE_SUFFIX = /=s\d+-c$/;

const buildInitialsAvatar = (name?: string | null): string => {
  const value = (name || "User").trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(value)}&background=0f172a&color=ffffff&size=256`;
};

const buildEmailAvatar = (email: string, name?: string | null): string => {
  const trimmedEmail = email.trim().toLowerCase();
  const initialsFallback = buildInitialsAvatar(
    name || trimmedEmail.split("@")[0],
  );

  // unavatar resolves profile pictures from multiple providers and domains.
  // If no remote avatar is found, it falls back to generated initials.
  return `https://unavatar.io/${encodeURIComponent(trimmedEmail)}?fallback=${encodeURIComponent(initialsFallback)}`;
};

export const normalizeAvatarUrl = (
  avatar?: string | null,
  email?: string | null,
  name?: string | null,
): string => {
  const trimmedAvatar = avatar?.trim();

  if (trimmedAvatar) {
    // Google profile photos often include a tiny size suffix like "=s96-c".
    // Requesting a larger size avoids blurry/empty-looking thumbnails.
    if (trimmedAvatar.includes("googleusercontent.com")) {
      return trimmedAvatar.replace(GOOGLE_SIZE_SUFFIX, "=s400-c");
    }

    return trimmedAvatar;
  }

  if (email?.trim()) {
    return buildEmailAvatar(email, name);
  }

  if (name?.trim()) {
    return buildInitialsAvatar(name);
  }

  return "/placeholder-profile.png";
};
