import { Controller, Get, Param } from '@nestjs/common';
import { ZonesService } from './zones.service';

@Controller('zones')
export class ZonesController {
    constructor(private readonly zonesService: ZonesService) { }

    @Get()
    findAll() {
        return this.zonesService.findAll();
    }

    @Get('location/:locationId')
    findByLocationId(@Param('locationId') locationId: string) {
        return this.zonesService.findByLocationId(locationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.zonesService.findOne(id);
    }
}

