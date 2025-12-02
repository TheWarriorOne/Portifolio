module.exports = {
  apps: [
    {
      name: "ecogram-backend",
      script: "node",
      args: "src/server.js", // usa server.js que chama connectDB(process.env.MONGO_URI)
      cwd: "/var/www/ecogram-backend", // ajuste conforme o caminho
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production"
      },
      max_memory_restart: "500M",
      instances: 1,
      autorestart: true,
      watch: false
    }
  ]
}
