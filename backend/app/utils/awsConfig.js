
export function isAwsCredentialsConfigured() {
  return (
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  );
}

export function getAwsCredentials() {
  if (!isAwsCredentialsConfigured()) {
    throw new Error('AWS credentials are not configured in environment variables');
  }

  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
