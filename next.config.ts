import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/prontuario", destination: "/dashboard/pacientes" },
      { source: "/prontuario/:path*", destination: "/dashboard/pacientes/:path*" },
      { source: "/evolucao", destination: "/dashboard/evolucao" },
      { source: "/configuracoes", destination: "/dashboard/configuracoes" },
    ];
  },
};

export default nextConfig;
