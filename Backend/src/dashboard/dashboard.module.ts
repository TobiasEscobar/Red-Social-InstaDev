import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserModule } from '../user/user.module';
import { PublicationsModule } from '../publications/publications.module';

@Module({
    imports: [
        UserModule,
        PublicationsModule
    ],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule {}