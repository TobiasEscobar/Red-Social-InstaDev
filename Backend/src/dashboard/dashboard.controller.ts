import { Controller, Get, Post, Param, Body, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    private validateAdmin(request: any) {
        const user = request.user;
        if (user.role !== 'administrador') {
            throw new UnauthorizedException('Acceso denegado: Se requieren permisos de administrador.');
        }
    }

    @Get('stats')
    async getStats(@Query('from') from?: string, @Query('to') to?: string) {
        // Parsear fechas
        const dateFrom = from ? new Date(from) : new Date(0);
        const dateTo = to ? new Date(to) : new Date();

        // Ajustar 'dateTo' al final del dia
        dateTo.setHours(23, 59, 59, 999);

        return this.dashboardService.getAdminStats(dateFrom, dateTo);
    }

    @Get('users')
    async getUsers(@Req() req) {
        this.validateAdmin(req);
        return this.dashboardService.getAllUsers();
    }

    @Post('users/:id/status')
    async changeStatus(@Param('id') id: string, @Body('action') action: 'enable' | 'disable', @Req() req) {
        this.validateAdmin(req);
        return this.dashboardService.toggleUserStatus(id, action);
    }
}