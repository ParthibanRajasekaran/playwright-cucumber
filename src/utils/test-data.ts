/**
 * Test Data Management
 * Centralized location for test data used across differ        admin      credentials: {
        admin: {
          username: process.env['PROD_ADMIN_USERNAME'] || '',
          password: process.env['PROD_ADMIN_PASSWORD'] || '',
          email: process.env['PROD_ADMIN_EMAIL'] || '',
          role: 'administrator'
        },
        user: {
          username: process.env['PROD_USER_USERNAME'] || '',
          password: process.env['PROD_USER_PASSWORD'] || '',
          email: process.env['PROD_USER_EMAIL'] || '',
          role: 'user'
        },
        readonly: {
          username: process.env['PROD_READONLY_USERNAME'] || '',
          password: process.env['PROD_READONLY_PASSWORD'] || '',
          email: process.env['PROD_READONLY_EMAIL'] || '',rname: process.env['PROD_ADMIN_USERNAME'] || '',
          password: process.env['PROD_ADMIN_PASSWORD'] || '',
          email: process.env['PROD_ADMIN_EMAIL'] || '',
        },
        user: {
          username: process.env['PROD_USER_USERNAME'] || '',
          password: process.env['PROD_USER_PASSWORD'] || '',
          email: process.env['PROD_USER_EMAIL'] || '',
        },
        readonly: {
          username: process.env['PROD_READONLY_USERNAME'] || '',
          password: process.env['PROD_READONLY_PASSWORD'] || '',
          email: process.env['PROD_READONLY_EMAIL'] || '',
        },
 */

export interface UserCredentials {
  username: string;
  password: string;
  email?: string;
  role?: string;
}

export interface TestEnvironment {
  name: string;
  baseUrl: string;
  apiUrl?: string;
  credentials: {
    admin: UserCredentials;
    user: UserCredentials;
    readonly: UserCredentials;
  };
}

/**
 * Test data for different environments
 */
export const testData = {
  environments: {
    "the-internet": {
      name: "The Internet Test Site",
      baseUrl: "https://the-internet.herokuapp.com",
      credentials: {
        admin: {
          username: "tomsmith",
          password: "SuperSecretPassword!",
          email: "tomsmith@example.com",
          role: "user",
        },
        user: {
          username: "tomsmith",
          password: "SuperSecretPassword!",
          email: "tomsmith@example.com",
          role: "user",
        },
        readonly: {
          username: "tomsmith",
          password: "SuperSecretPassword!",
          email: "tomsmith@example.com",
          role: "user",
        },
      },
    },

    demo: {
      name: "Demo Environment",
      baseUrl: "https://demo.playwright.dev",
      credentials: {
        admin: {
          username: "admin",
          password: "admin123",
          email: "admin@example.com",
          role: "administrator",
        },
        user: {
          username: "user",
          password: "user123",
          email: "user@example.com",
          role: "user",
        },
        readonly: {
          username: "readonly",
          password: "readonly123",
          email: "readonly@example.com",
          role: "readonly",
        },
      },
    },

    staging: {
      name: "Staging Environment",
      baseUrl: "https://staging.example.com",
      apiUrl: "https://api-staging.example.com",
      credentials: {
        admin: {
          username: "admin@staging.com",
          password: "StaginG@dm1n!",
          email: "admin@staging.com",
          role: "administrator",
        },
        user: {
          username: "testuser@staging.com",
          password: "TestU$er123",
          email: "testuser@staging.com",
          role: "user",
        },
        readonly: {
          username: "readonly@staging.com",
          password: "ReadOnlY456",
          email: "readonly@staging.com",
          role: "readonly",
        },
      },
    },

    production: {
      name: "Production Environment",
      baseUrl: "https://app.example.com",
      apiUrl: "https://api.example.com",
      credentials: {
        admin: {
          username: process.env["PROD_ADMIN_USERNAME"] || "",
          password: process.env["PROD_ADMIN_PASSWORD"] || "",
          email: process.env["PROD_ADMIN_EMAIL"] || "",
          role: "administrator",
        },
        user: {
          username: process.env["PROD_USER_USERNAME"] || "",
          password: process.env["PROD_USER_PASSWORD"] || "",
          email: process.env["PROD_USER_EMAIL"] || "",
          role: "user",
        },
        readonly: {
          username: process.env["PROD_READONLY_USERNAME"] || "",
          password: process.env["PROD_READONLY_PASSWORD"] || "",
          email: process.env["PROD_READONLY_EMAIL"] || "",
          role: "readonly",
        },
      },
    },
  },

  /**
   * Test data for form validation scenarios
   */
  invalidCredentials: {
    empty: {
      username: "",
      password: "",
    },
    invalidUsername: {
      username: "invalid@user.com",
      password: "validPassword123",
    },
    invalidPassword: {
      username: "valid@user.com",
      password: "wrongpassword",
    },
    malformed: {
      username: "not-an-email",
      password: "123",
    },
    specialCharacters: {
      username: "user@domain.com",
      password: "Pass!@#$%^&*()",
    },
  },

  /**
   * Sample form data
   */
  forms: {
    registration: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1-555-123-4567",
      company: "Acme Corp",
      jobTitle: "Software Engineer",
    },

    profile: {
      bio: "Experienced software engineer with expertise in test automation.",
      website: "https://johndoe.dev",
      linkedIn: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
    },
  },

  /**
   * Test messages and expected text
   */
  messages: {
    login: {
      success: "Welcome back!",
      invalidCredentials: "Invalid username or password",
      emptyFields: "Please fill in all required fields",
      accountLocked: "Account has been locked due to multiple failed attempts",
    },

    dashboard: {
      welcome: "Dashboard",
      noData: "No data available",
      loading: "Loading...",
    },

    errors: {
      network: "Network error occurred",
      server: "Internal server error",
      notFound: "Page not found",
      unauthorized: "Unauthorized access",
    },
  },

  /**
   * Timeouts for different operations
   */
  timeouts: {
    short: 5000, // 5 seconds
    medium: 15000, // 15 seconds
    long: 30000, // 30 seconds
    extended: 60000, // 1 minute
  },

  /**
   * File paths for uploads and downloads
   */
  files: {
    sample: {
      pdf: "test-data/sample.pdf",
      image: "test-data/sample.jpg",
      csv: "test-data/sample.csv",
      txt: "test-data/sample.txt",
    },

    downloads: "test-results/downloads/",
    uploads: "test-data/uploads/",
  },
};

/**
 * Get environment configuration based on environment name
 * @param envName - Environment name (the-internet, demo, staging, production)
 */
export function getEnvironment(
  envName: string = "the-internet",
): TestEnvironment {
  const env =
    testData.environments[envName as keyof typeof testData.environments];
  if (!env) {
    throw new Error(`Environment '${envName}' not found`);
  }
  return env;
}

/**
 * Get credentials for a specific role in an environment
 * @param role - User role (admin, user, readonly) or environment name for backward compatibility
 * @param envName - Environment name (defaults to 'the-internet')
 */
export function getCredentials(
  role: string = "user",
  envName: string = "the-internet",
): UserCredentials {
  // Handle backward compatibility - if role looks like an environment name, swap parameters
  if (
    role === "valid" ||
    role === "invalid" ||
    role === "demo" ||
    role === "staging"
  ) {
    envName = role === "valid" ? "the-internet" : role;
    role = "user";
  }

  const env = getEnvironment(envName);
  const credentials = env.credentials[role as keyof typeof env.credentials];
  if (!credentials) {
    throw new Error(`Role '${role}' not found in environment '${envName}'`);
  }
  return credentials;
}

/**
 * Generate random test data
 */
export const generateTestData = {
  email: (): string => `test${Date.now()}@example.com`,
  username: (): string => `user${Date.now()}`,
  password: (): string => `Pass${Date.now()}!`,
  phoneNumber: (): string =>
    `+1-555-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
  companyName: (): string => `Company ${Date.now()}`,

  /**
   * Generate a random string of specified length
   * @param length - Desired string length
   * @param charset - Character set to use
   */
  randomString: (
    length: number = 10,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ): string => {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },
};
