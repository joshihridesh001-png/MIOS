import { describe, it, expect } from 'vitest';
import {
  inferCreativeMetadataFromFilename,
  generateSmartCreativeDraft,
  isVideoAssetUrl,
} from '../creative-parser';

describe('Zero-Effort Creative Metadata Inference & 1-Click Auto-Draft Engine', () => {
  describe('inferCreativeMetadataFromFilename', () => {
    it('extracts clean title, video format, fear_urgency angle, and tags from video filename', () => {
      const result = inferCreativeMetadataFromFilename(
        'q4_tax_audit_fear_hook_v2.mp4',
        'video/mp4'
      );

      expect(result.name).toBe('Q4 Tax Audit Fear Hook V2');
      expect(result.format).toBe('video');
      expect(result.angle).toBe('fear_urgency');
      expect(result.tags).toEqual(['tax', 'audit', 'fear', 'hook']);
    });

    it('detects carousel and image formats, platform keywords, and social proof / authority angles', () => {
      const socialCarousel = inferCreativeMetadataFromFilename(
        'meta_client_testimonial_carousel_final.png',
        'image/png'
      );
      expect(socialCarousel.name).toBe('Meta Client Testimonial Carousel Final');
      expect(socialCarousel.format).toBe('carousel');
      expect(socialCarousel.angle).toBe('social_proof_reviews');
      expect(socialCarousel.platform).toBe('meta_ads');

      const authoritySearch = inferCreativeMetadataFromFilename(
        '20261102_google_sla_certified_guarantee_v1.jpg'
      );
      expect(authoritySearch.name).toBe('Google SLA Certified Guarantee V1');
      expect(authoritySearch.format).toBe('image');
      expect(authoritySearch.angle).toBe('authority_guarantee');
      expect(authoritySearch.platform).toBe('google_ads');
    });
  });

  describe('generateSmartCreativeDraft', () => {
    it('generates industry-agnostic headline, primary_text, cta_text, and hook_hypothesis incorporating context', () => {
      const draft = generateSmartCreativeDraft(
        'fear_urgency',
        'Q4 Tax Audit Fear Hook V2',
        'Enterprise CFO Retainer'
      );

      expect(draft.angle).toBe('fear_urgency');
      expect(draft.headline).toBeTruthy();
      expect(draft.primary_text).toContain('Enterprise CFO Retainer');
      expect(draft.cta_text).toBe('Book Risk Audit');
      expect(draft.hook_hypothesis).toContain('Enterprise CFO Retainer');
    });
  });

  describe('isVideoAssetUrl', () => {
    it('identifies video URLs and video format accurately', () => {
      expect(isVideoAssetUrl('https://cdn.example.com/creatives/hook_v2.mp4?token=123')).toBe(true);
      expect(isVideoAssetUrl('/uploads/reel.webm')).toBe(true);
      expect(isVideoAssetUrl('/uploads/demo.mov')).toBe(true);
      expect(isVideoAssetUrl('/uploads/banner.png', 'video')).toBe(true);
      expect(isVideoAssetUrl('/uploads/banner.png', 'image')).toBe(false);
      expect(isVideoAssetUrl(null, 'image')).toBe(false);
    });
  });
});
