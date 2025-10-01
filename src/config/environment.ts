import * as fs from "fs";
import * as path from "path";

/**
 * Environment Configuration Interface
 * Defines the structure for environment-specific settings
 */
export interface EnvironmentConfig {
  name: string;
  application: {
    baseURL: string;
    loginURL?: string;
    apiBaseURL?: string;
    timeout: {
      default: number;
      navigation: number;
      action: number;
    };
  };
  database?: {
    host?: string;
    port?: number;
    name?: string;
    ssl?: boolean;
  };
  api?: {
    endpoints: Record<string, string>;
    headers?: Record<string, string>;
    timeout: number;
  };
  testData: {
    directory: string;
    users: {
      valid: {
        username: string;
        password: string;
      };
      invalid: {
        username: string;
        password: string;
      };
      admin?: {
        username: string;
        password: string;
      };
    };
  };
  features: {
    enableVideoRecording: boolean;
    enableTracing: boolean;
    enableScreenshots: boolean;
    enableAccessibilityTesting: boolean;
    enablePerformanceTesting: boolean;
  };
  browser: {
    headless: boolean;
    slowMo: number;
    viewport: {
      width: number;
      height: number;
    };
    locale: string;
    timezone: string;
  };
  reporting: {
    outputDir: string;
    formats: string[];
    includePassedTests: boolean;
  };
}

/**
 * Default base configuration that applies to all environments
 */
const baseConfig: Omit<Partial<EnvironmentConfig>, 'application'> & {
  application?: Partial<EnvironmentConfig['application']>;
} = {
  application: {
    timeout: {
      default: 30000,
      navigation: 30000,
      action: 15000,
    },
  },
  api: {
    timeout: 10000,
    endpoints: {},
    headers: {
      "Content-Type": "application/json",
    },
  },
  features: {
    enableVideoRecording: true,
    enableTracing: true,
    enableScreenshots: true,
    enableAccessibilityTesting: false,
    enablePerformanceTesting: false,
  },
  browser: {
    headless: process.env.CI === "true",
    slowMo: 0,
    viewport: {
      width: 1280,
      height: 720,
    },
    locale: "en-US",
    timezone: "America/New_York",
  },
  reporting: {
    outputDir: "reports",
    formats: ["html", "json"],
    includePassedTests: false,
  },
};

/**
 * Environment Configuration Manager
 * Handles loading, merging, and validating environment configurations
 */
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private currentConfig: EnvironmentConfig;
  private environment: string;

  private constructor() {
    this.environment = this.determineEnvironment();
    this.currentConfig = this.loadConfiguration();
  }

  /**
   * Get singleton instance of EnvironmentManager
   */
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Get current environment configuration
   */
  public getConfig(): EnvironmentConfig {
    return this.currentConfig;
  }

  /**
   * Get current environment name
   */
  public getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get application base URL with environment variable override
   */
  public getBaseURL(): string {
    return process.env.BASE_URL || this.currentConfig.application.baseURL;
  }

  /**
   * Get test data directory for current environment
   */
  public getTestDataDirectory(): string {
    const envOverride = process.env.TEST_DATA_DIR;
    if (envOverride) {
      return path.resolve(envOverride);
    }
    return path.resolve(this.currentConfig.testData.directory);
  }

  /**
   * Get environment-specific test data file path
   */
  public getTestDataPath(filename: string): string {
    return path.join(this.getTestDataDirectory(), filename);
  }

  /**
   * Get user credentials for the current environment
   */
  public getCredentials(type: "valid" | "invalid" | "admin"): {
    username: string;
    password: string;
  } {
    const credentials = this.currentConfig.testData.users[type];
    if (!credentials) {
      throw new Error(`Credentials for type "${type}" not found in environment "${this.environment}"`);
    }

    return {
      username: process.env[`${type.toUpperCase()}_USERNAME`] || credentials.username,
      password: process.env[`${type.toUpperCase()}_PASSWORD`] || credentials.password,
    };
  }

  /**
   * Check if a feature is enabled for the current environment
   */
  public isFeatureEnabled(feature: keyof EnvironmentConfig["features"]): boolean {
    return this.currentConfig.features[feature];
  }

  /**
   * Get API endpoint URL
   */
  public getAPIEndpoint(name: string): string {
    const endpoint = this.currentConfig.api?.endpoints[name];
    if (!endpoint) {
      throw new Error(`API endpoint "${name}" not found in environment "${this.environment}"`);
    }
    return endpoint;
  }

  /**
   * Print current configuration summary
   */
  public printConfigSummary(): void {
    console.log("🌍 Environment Configuration Summary:");
    console.log(`   📍 Environment: ${this.environment}`);
    console.log(`   🌐 Base URL: ${this.getBaseURL()}`);
    console.log(`   📂 Test Data Directory: ${this.getTestDataDirectory()}`);
    console.log(`   🎥 Video Recording: ${this.isFeatureEnabled("enableVideoRecording") ? "✅" : "❌"}`);
    console.log(`   📊 Tracing: ${this.isFeatureEnabled("enableTracing") ? "✅" : "❌"}`);
    console.log(`   📸 Screenshots: ${this.isFeatureEnabled("enableScreenshots") ? "✅" : "❌"}`);
    console.log("");
  }

  /**
   * Determine the current environment from various sources
   */
  private determineEnvironment(): string {
    // Priority: ENV variable > NODE_ENV > default
    return (
      process.env.TEST_ENV ||
      process.env.NODE_ENV ||
      process.env.ENVIRONMENT ||
      "dev"
    );
  }

  /**
   * Load and merge configuration for the current environment
   */
  private loadConfiguration(): EnvironmentConfig {
    try {
      // Load environment-specific configuration
      const configPath = path.resolve(`config/${this.environment}.json`);
      let envConfig: Partial<EnvironmentConfig> = {};

      if (fs.existsSync(configPath)) {
        const fileContent = fs.readFileSync(configPath, "utf-8");
        envConfig = JSON.parse(fileContent);
        console.log(`📝 Loaded configuration from: ${configPath}`);
      } else {
        console.log(`⚠️  Configuration file not found: ${configPath}, using defaults`);
      }

      // Merge base config with environment-specific config
      const mergedConfig = this.deepMerge(baseConfig, envConfig) as EnvironmentConfig;

      // Apply environment variable overrides
      this.applyEnvironmentOverrides(mergedConfig);

      // Validate configuration
      this.validateConfiguration(mergedConfig);

      return mergedConfig;
    } catch (error) {
      console.error(`❌ Failed to load configuration for environment "${this.environment}":`, error);
      throw error;
    }
  }

  /**
   * Apply environment variable overrides to configuration
   */
  private applyEnvironmentOverrides(config: EnvironmentConfig): void {
    // Override application settings
    if (process.env.BASE_URL) {
      config.application.baseURL = process.env.BASE_URL;
    }
    if (process.env.API_BASE_URL) {
      config.application.apiBaseURL = process.env.API_BASE_URL;
    }
    if (process.env.LOGIN_URL) {
      config.application.loginURL = process.env.LOGIN_URL;
    }

    // Override timeouts
    if (process.env.DEFAULT_TIMEOUT) {
      config.application.timeout.default = parseInt(process.env.DEFAULT_TIMEOUT);
    }
    if (process.env.NAVIGATION_TIMEOUT) {
      config.application.timeout.navigation = parseInt(process.env.NAVIGATION_TIMEOUT);
    }
    if (process.env.ACTION_TIMEOUT) {
      config.application.timeout.action = parseInt(process.env.ACTION_TIMEOUT);
    }

    // Override browser settings
    if (process.env.HEADLESS !== undefined) {
      config.browser.headless = process.env.HEADLESS === "true";
    }
    if (process.env.SLOW_MO) {
      config.browser.slowMo = parseInt(process.env.SLOW_MO);
    }
    if (process.env.VIEWPORT_WIDTH) {
      config.browser.viewport.width = parseInt(process.env.VIEWPORT_WIDTH);
    }
    if (process.env.VIEWPORT_HEIGHT) {
      config.browser.viewport.height = parseInt(process.env.VIEWPORT_HEIGHT);
    }

    // Override feature flags
    if (process.env.ENABLE_VIDEO !== undefined) {
      config.features.enableVideoRecording = process.env.ENABLE_VIDEO === "true";
    }
    if (process.env.ENABLE_TRACING !== undefined) {
      config.features.enableTracing = process.env.ENABLE_TRACING === "true";
    }
    if (process.env.ENABLE_SCREENSHOTS !== undefined) {
      config.features.enableScreenshots = process.env.ENABLE_SCREENSHOTS === "true";
    }
  }

  /**
   * Validate the merged configuration
   */
  private validateConfiguration(config: EnvironmentConfig): void {
    if (!config.name) {
      config.name = this.environment;
    }

    if (!config.application?.baseURL) {
      throw new Error(`Base URL is required for environment "${this.environment}"`);
    }

    if (!config.testData?.directory) {
      config.testData = {
        ...config.testData,
        directory: `test-data/${this.environment}`,
      };
    }

    // Ensure test data directory exists
    const testDataDir = path.resolve(config.testData.directory);
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
      console.log(`📂 Created test data directory: ${testDataDir}`);
    }
  }

  /**
   * Deep merge two objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }
}

/**
 * Convenience function to get environment manager instance
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return EnvironmentManager.getInstance().getConfig();
}

/**
 * Convenience function to get current environment name
 */
export function getCurrentEnvironment(): string {
  return EnvironmentManager.getInstance().getEnvironment();
}

/**
 * Convenience function to get environment-specific credentials
 */
export function getEnvironmentCredentials(type: "valid" | "invalid" | "admin"): {
  username: string;
  password: string;
} {
  return EnvironmentManager.getInstance().getCredentials(type);
}

/**
 * Convenience function to check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof EnvironmentConfig["features"]): boolean {
  return EnvironmentManager.getInstance().isFeatureEnabled(feature);
}