// next.config.mjs

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'oldschool.runescape.wiki',
                port: '',
                pathname: '/images/**',
            },
        ],
    },
};

export default nextConfig;
