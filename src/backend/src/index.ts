import Fastify from 'fastify'
import "./config/firebase";

const fastify = Fastify({
    logger: true
});

fastify.get("/", async () => {
    return { 
        message: "Fastify server running"
    };
});

try {
    await fastify.listen({
        port: 3000, host: "0.0.0.0"
    });
    console.log("🚀 Server started on http://localhost:3000");
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}