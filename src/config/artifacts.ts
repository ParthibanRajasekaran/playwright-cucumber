/**
 * Test Execution Configuration
 * Supports environment variables and command-line flags for controlling
 * test artifacts generation (screenshots, videos, traces)
 */

export interface TestArtifactConfig {
  screenshots: boolean;
  videos: boolean;
  traces: boolean;
  onlyOnFailure: boolean;
}

/**
 * Parse environment variables and return test artifact configuration
 */
export function getTestArtifactConfig(): TestArtifactConfig {
  const config: TestArtifactConfig = {
    // Screenshot configuration
    screenshots:
      process.env["SCREENSHOTS"] !== "false" &&
      process.env["NO_SCREENSHOTS"] !== "true",

    // Video configuration
    videos:
      process.env["VIDEOS"] !== "false" && process.env["NO_VIDEOS"] !== "true",

    // Trace configuration
    traces:
      process.env["TRACES"] !== "false" && process.env["NO_TRACES"] !== "true",

    // Only generate on failure (default: true)
    onlyOnFailure: process.env["ARTIFACTS_ON_SUCCESS"] !== "true",
  };

  // Override with specific flags
  if (process.env["FORCE_SCREENSHOTS"] === "true") config.screenshots = true;
  if (process.env["FORCE_VIDEOS"] === "true") config.videos = true;
  if (process.env["FORCE_TRACES"] === "true") config.traces = true;

  // Disable all artifacts flag
  if (process.env["NO_ARTIFACTS"] === "true") {
    config.screenshots = false;
    config.videos = false;
    config.traces = false;
  }

  return config;
}

/**
 * Environment variable documentation
 */
export const ARTIFACT_ENV_DOCS = `
🎛️  Test Artifact Configuration Environment Variables:

📸 SCREENSHOTS (default: true)
   SCREENSHOTS=false          # Disable screenshots
   NO_SCREENSHOTS=true        # Disable screenshots (alternative)
   FORCE_SCREENSHOTS=true     # Force screenshots even on success

🎥 VIDEOS (default: true)
   VIDEOS=false              # Disable video recording
   NO_VIDEOS=true            # Disable video recording (alternative) 
   FORCE_VIDEOS=true         # Force videos even on success

📊 TRACES (default: true)
   TRACES=false              # Disable trace collection
   NO_TRACES=true            # Disable traces (alternative)
   FORCE_TRACES=true         # Force traces even on success

🎯 GLOBAL CONTROLS
   NO_ARTIFACTS=true         # Disable all artifacts
   ARTIFACTS_ON_SUCCESS=true # Generate artifacts for passing tests too

📋 USAGE EXAMPLES:
   npm test                                    # Default: all artifacts on failure
   VIDEOS=false npm test                      # No videos
   NO_ARTIFACTS=true npm test                 # No artifacts at all
   ARTIFACTS_ON_SUCCESS=true npm test         # Artifacts for all tests
   FORCE_VIDEOS=true SCREENSHOTS=false npm test # Only videos (forced)
`;

/**
 * Print current artifact configuration
 */
export function printArtifactConfig(config: TestArtifactConfig): void {
  console.log("🎛️  Test Artifact Configuration:");
  console.log(
    `   📸 Screenshots: ${config.screenshots ? "✅ Enabled" : "❌ Disabled"}`,
  );
  console.log(`   🎥 Videos: ${config.videos ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(`   📊 Traces: ${config.traces ? "✅ Enabled" : "❌ Disabled"}`);
  console.log(
    `   🎯 Mode: ${config.onlyOnFailure ? "Failure Only" : "All Tests"}`,
  );
  console.log("");
}
