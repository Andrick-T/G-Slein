const readOptionalEnv = (name) => {
  const value = process.env[name];

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

export const externalServicesConfig = Object.freeze({
  stripe: Object.freeze({
    secretKey: readOptionalEnv("STRIPE_SECRET_KEY"),
    publishableKey: readOptionalEnv("STRIPE_PUBLISHABLE_KEY"),
    webhookSecret: readOptionalEnv("STRIPE_WEBHOOK_SECRET"),
  }),
  nokash: Object.freeze({
    apiKey: readOptionalEnv("NOKASH_API_KEY"),
    webhookSecret: readOptionalEnv("NOKASH_WEBHOOK_SECRET"),
  }),
  email: Object.freeze({
    apiKey: readOptionalEnv("RESEND_API_KEY"),
    from: readOptionalEnv("EMAIL_FROM"),
  }),
  r2: Object.freeze({
    accountId: readOptionalEnv("R2_ACCOUNT_ID"),
    endpoint: readOptionalEnv("R2_ENDPOINT"),
    bucketName: readOptionalEnv("R2_BUCKET_NAME"),
    accessKeyId: readOptionalEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: readOptionalEnv("R2_SECRET_ACCESS_KEY"),
  }),
  jitsi: Object.freeze({
    domain: readOptionalEnv("JITSI_DOMAIN"),
  }),
});

const serviceEnvMap = Object.freeze({
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  nokash: ["NOKASH_API_KEY", "NOKASH_WEBHOOK_SECRET"],
  email: ["RESEND_API_KEY", "EMAIL_FROM"],
  r2: [
    "R2_ACCOUNT_ID",
    "R2_ENDPOINT",
    "R2_BUCKET_NAME",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ],
  jitsi: ["JITSI_DOMAIN"],
});

export const getMissingServiceEnv = (serviceName) => {
  const envNames = serviceEnvMap[serviceName] || [];

  return envNames.filter((envName) => !readOptionalEnv(envName));
};

export const assertServiceConfigured = (serviceName) => {
  const missingEnv = getMissingServiceEnv(serviceName);

  if (missingEnv.length > 0) {
    throw new Error(
      `${serviceName} is not configured. Missing environment variables: ${missingEnv.join(
        ", ",
      )}`,
    );
  }

  return externalServicesConfig[serviceName];
};
