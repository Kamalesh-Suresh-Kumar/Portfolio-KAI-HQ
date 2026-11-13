/**
 * KAI HQ — Boot Sequence Timing Configuration
 * Intentionally paced at 7.0 seconds (within 5–9s window) so first-time visitors
 * can read all initialization diagnostics while retaining 1-interaction skip and
 * instantaneous 0ms bypass under reduced motion or deep links.
 */
export const BOOT_SEQUENCE_DURATION_MS = 7000;
export const BOOT_COMPLETION_HOLD_MS = 150;
export const BOOT_EXIT_TRANSITION_MS = 250;
