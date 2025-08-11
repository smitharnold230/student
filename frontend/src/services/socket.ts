import { io, Socket } from 'socket.io-client';

class SocketService {
    private static instance: SocketService;
    private socket: Socket | null = null;

    private constructor() {}

    static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }

    connect(userId: string) {
        this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:4000');
        
        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
            this.socket?.emit('join', userId);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback: (notification: any) => void) {
        this.socket?.on('notification', callback);
    }

    removeNotificationListener() {
        this.socket?.off('notification');
    }
}

export default SocketService;
