import { Server } from "socket.io";
import Redis from 'ioredis'

const pub = new Redis({
    host: 'redis-34d4b67c-yogesharyal2525-182e.a.aivencloud.com',
    port: 12198,
    username: 'default',
    password: 'AVNS_FcwbIxQ_fOYGRZOWHFo'
});
const sub = new Redis({
    host: 'redis-34d4b67c-yogesharyal2525-182e.a.aivencloud.com',
    port: 12198,
    username: 'default',
    password: 'AVNS_FcwbIxQ_fOYGRZOWHFo'
});
class SocketService {
    private _io: Server;
    constructor() {
        console.log("Init Socket Server...");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*"
            }
        });
        sub.subscribe('MESSAGES');
    }
    public initListeners() {
        const io = this._io;
        console.log('Init Socket Listeners...')
        io.on('connect', socket => {
            console.log(`New Socket Connected`, socket.id);
            socket.on('event:message', async ({ message }: { message: string }) => {
                console.log(`New Message Recieved. `, message);
                // publish this message to redis
                await pub.publish('MESSAGES', JSON.stringify({ message }))
            })
        })

        sub.on('message', (channel, message) => {
            console.log('new message from redis', message)
            if (channel === 'MESSAGES') {
                io.emit('message', { message });
            }
        })
    }
    get io() {
        return this._io;
    }
}

export default SocketService;