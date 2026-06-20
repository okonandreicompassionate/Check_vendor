// lib/platform.ts
// Platform validation and formatting rules

export type Platform = "instagram" | "whatsapp" | "twitter" | "tiktok";

export interface PlatformValidation {
  valid: boolean;
  error?: string;
  formatted?: string; // cleaned up version of the handle
}

export interface PlatformConfig {
  label: string;
  placeholder: string;
  prefix: string; // what shows before the input
  color: string;
  example: string;
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  instagram: {
    label: "Instagram",
    placeholder: "vendorhandle",
    prefix: "@",
    color: "text-pink-400",
    example: "zeeluxury_ng",
  },
  tiktok: {
    label: "TikTok",
    placeholder: "vendorhandle",
    prefix: "@",
    color: "text-cyan-400",
    example: "fashionbyamaka",
  },
  twitter: {
    label: "Twitter / X",
    placeholder: "vendorhandle",
    prefix: "@",
    color: "text-sky-400",
    example: "vendor_ng",
  },
  whatsapp: {
    label: "WhatsApp",
    placeholder: "08012345678 or +2348012345678",
    prefix: "",
    color: "text-green-400",
    example: "08012345678",
  },
};

// Nigerian and common African phone number patterns
const PHONE_PATTERNS = [
  /^0[7-9][0-1]\d{8}$/, // Nigerian 11-digit (080, 081, 070, 090 etc)
  /^\+234[7-9][0-1]\d{8}$/, // Nigerian with +234
  /^234[7-9][0-1]\d{8}$/, // Nigerian with 234
  /^\+233\d{9}$/, // Ghana +233
  /^\+254\d{9}$/, // Kenya +254
  /^\+27\d{9}$/, // South Africa +27
];

// Social handle pattern — letters, numbers, underscores, dots only
const HANDLE_PATTERN = /^[a-zA-Z0-9_.]{1,50}$/;

// TikTok handles can also have dots
const TIKTOK_PATTERN = /^[a-zA-Z0-9_.]{1,24}$/;

export function validateHandle(
  handle: string,
  platform: Platform
): PlatformValidation {
  const cleaned = handle.trim().replace(/^@/, "").toLowerCase();

  if (!cleaned) {
    return { valid: false, error: "Please enter a handle or number." };
  }

  switch (platform) {
    case "whatsapp": {
      // Must be a valid phone number
      const isPhone = PHONE_PATTERNS.some((p) => p.test(cleaned));
      if (!isPhone) {
        return {
          valid: false,
          error:
            "WhatsApp requires a valid phone number (e.g. 08012345678 or +2348012345678).",
        };
      }
      // Normalize to local format
      let formatted = cleaned;
      if (formatted.startsWith("+234")) formatted = "0" + formatted.slice(4);
      if (formatted.startsWith("234")) formatted = "0" + formatted.slice(3);
      return { valid: true, formatted };
    }

    case "instagram": {
      if (!HANDLE_PATTERN.test(cleaned)) {
        return {
          valid: false,
          error:
            "Instagram handles can only contain letters, numbers, underscores, and dots (max 50 chars).",
        };
      }
      if (cleaned.length < 2) {
        return { valid: false, error: "Handle is too short." };
      }
      return { valid: true, formatted: cleaned };
    }

    case "tiktok": {
      if (!TIKTOK_PATTERN.test(cleaned)) {
        return {
          valid: false,
          error:
            "TikTok handles can only contain letters, numbers, underscores, and dots (max 24 chars).",
        };
      }
      if (cleaned.length < 2) {
        return { valid: false, error: "Handle is too short." };
      }
      return { valid: true, formatted: cleaned };
    }

    case "twitter": {
      // Twitter handles: letters, numbers, underscores only, max 15 chars
      const twitterPattern = /^[a-zA-Z0-9_]{1,15}$/;
      if (!twitterPattern.test(cleaned)) {
        return {
          valid: false,
          error:
            "Twitter handles can only contain letters, numbers, and underscores (max 15 chars).",
        };
      }
      return { valid: true, formatted: cleaned };
    }

    default:
      return { valid: false, error: "Unknown platform." };
  }
}

export function getPlatformWarning(platform: Platform): string {
  const warnings: Record<Platform, string> = {
    instagram:
      "We cannot verify this handle exists on Instagram. Always confirm the vendor's account is active before transacting.",
    tiktok:
      "We cannot verify this handle exists on TikTok. Always confirm the vendor's account is active before transacting.",
    twitter:
      "We cannot verify this handle exists on Twitter/X. Always confirm the vendor's account is active before transacting.",
    whatsapp:
      "We cannot verify this number is active on WhatsApp. Always confirm before sending money.",
  };
  return warnings[platform];
}

export function formatHandleForDisplay(
  handle: string,
  platform: Platform
): string {
  if (platform === "whatsapp") return handle;
  return `@${handle}`;
}
