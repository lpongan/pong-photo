/**
 * Astro ExternalImageService for Cloudinary.
 *
 * Translates Astro ImageTransform options into Cloudinary URL transformation
 * parameters. Because all image processing happens on Cloudinary's CDN (not
 * locally), this service works identically in dev and production with zero
 * build-time overhead.
 *
 * Usage in astro.config.mjs:
 *   image: { service: { entrypoint: "./src/services/cloudinary.ts" } }
 *
 * getURL  — builds a single Cloudinary URL for a given transform
 * getSrcSet — returns one transform per entry in options.widths; Astro calls
 *             getURL on each to assemble the final srcset attribute string
 */

import type { ExternalImageService } from "astro/assets/services/service.js";
import type { ImageTransform } from "astro";

const QUALITY_MAP: Record<string, string> = {
  low: "q_auto:low",
  mid: "q_auto:good",
  high: "q_auto:best",
  max: "q_100",
};

const FIT_MAP: Record<string, string> = {
  fill: "c_fill",
  cover: "c_fill",
  contain: "c_fit",
  inside: "c_limit",
  "scale-down": "c_limit",
};

function buildTransformStr(options: ImageTransform): string {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${Math.round(options.width)}`);
  if (options.height) parts.push(`h_${Math.round(options.height)}`);

  if (options.fit && options.fit !== "none") {
    const crop = FIT_MAP[options.fit];
    if (crop) parts.push(crop);
  }

  if (options.format && options.format !== "auto") {
    parts.push(`f_${options.format}`);
  } else {
    parts.push("f_auto");
  }

  if (options.quality != null) {
    if (typeof options.quality === "number") {
      parts.push(`q_${options.quality}`);
    } else {
      parts.push(QUALITY_MAP[options.quality as string] ?? "q_auto");
    }
  } else {
    parts.push("q_auto");
  }

  return parts.join(",");
}

function applyTransforms(src: string, transforms: string): string {
  if (!src.includes("/upload/")) return src;
  return src.replace("/upload/", `/upload/${transforms}/`);
}

const cloudinaryService: ExternalImageService = {
  validateOptions(options) {
    return options;
  },

  getURL(options) {
    const src =
      typeof options.src === "string" ? options.src : (options.src as any).src;
    const transforms = buildTransformStr(options);
    if (!transforms) return src;
    return applyTransforms(src, transforms);
  },

  getSrcSet(options) {
    const widths = options.widths ?? [];
    const aspectRatio =
      options.width && options.height
        ? options.width / options.height
        : undefined;

    return widths.map((width) => {
      const height = aspectRatio ? Math.round(width / aspectRatio) : undefined;
      const transform: ImageTransform = {
        ...options,
        width,
        ...(height !== undefined ? { height } : {}),
      };
      return {
        transform,
        descriptor: `${width}w`,
        attributes: options.format ? { type: `image/${options.format}` } : {},
      };
    });
  },

  getHTMLAttributes(options) {
    const {
      src,
      width,
      height,
      format,
      quality,
      widths,
      densities,
      fit,
      position,
      background,
      ...rest
    } = options;
    return {
      ...rest,
      width: options.width,
      height: options.height,
    };
  },
};

export default cloudinaryService;
