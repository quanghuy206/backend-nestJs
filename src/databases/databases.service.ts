import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from 'src/permissions/schemas/permission.schema';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';
import { log } from 'console';

@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);
    constructor(
        @InjectModel(User.name)
        private userModel: SoftDeleteModel<UserDocument>,

        @InjectModel(Permission.name)
        private permissionModel: SoftDeleteModel<PermissionDocument>,

        @InjectModel(Role.name)
        private roleModel: SoftDeleteModel<RoleDocument>,

        private configService: ConfigService,

        private userService: UsersService
    ) { }

    async onModuleInit() {
        const isInit = this.configService.get<string>("SHOULD_INIT")
        if (Boolean(isInit)) {
            const countUser = await this.userModel.count({});
            const countPermission = await this.permissionModel.count({});
            const countRole = await this.roleModel.count({});

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }
            if (countPermission === 0) {
                let a = await this.permissionModel.insertMany(INIT_PERMISSIONS)
                log(a)
                return a
            }
            if (countRole === 0) {
                const permission = await this.permissionModel.find({}).select("_id")
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: "Admin có toàn bộ quyền hạn",
                        isActive: true,
                        permissions: permission
                    },
                    {
                        name: USER_ROLE,
                        description: "người dùng/ứng viên sử dụng hệ thống",
                        isActive: true,
                        permissions: []
                    }
                ])
            }
            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE })
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                await this.userModel.insertMany([
                    {
                        name: "I'm admin",
                        email: "admin@gmail.com",
                        password: this.userService.getHashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gende: "male",
                        address: "VietNam",
                        role: adminRole?._id
                    },
                    {
                        name: "Dev NestJs",
                        email: "devnest@gmail.com",
                        password: this.userService.getHashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gende: "male",
                        address: "VietNam",
                        role: adminRole?._id
                    },
                    {
                        name: "I'm user",
                        email: "user@gmail.com",
                        password: this.userService.getHashPassword(this.configService.get<string>("INIT_PASSWORD")),
                        age: 69,
                        gende: "male",
                        address: "VietNam",
                        role: userRole?._id
                    }
                ])
            }

        }
    }
}
