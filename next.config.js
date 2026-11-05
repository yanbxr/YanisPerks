const basePath = process.env.PAGES_BASE_PATH ?? ""

module.exports = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  allowedDevOrigins: ["127.0.0.1", "10.*.*.*", "192.168.*.*"],
}
