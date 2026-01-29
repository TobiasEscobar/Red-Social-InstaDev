import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly userService: UserService,
        private readonly pubService: PublicationsService
    ) {}

    // Recibe fechas como argumentos
    async getAdminStats(from: Date, to: Date) {
        const [users, stats] = await Promise.all([
        this.userService.findAll(),
        this.pubService.getStatistics(from, to) 
        ]);

        return {
        usersCount: users.length,
        ...stats
        };
    }

    // Metodos proxy para manejo de usuarios desde el dashboard
    async getAllUsers() {
        return this.userService.findAll();
    }

    async toggleUserStatus(id: string, action: 'enable' | 'disable') {
        if (action === 'disable') {
        return this.userService.remove(id); // Llama a soft-delete
        } else {
        return this.userService.restore(id);
        }
    }
}