import MasterLocation from "../models/masterLocation.models.js";
import { ApiResponse } from "../utils/api-response.js";

import { asyncHandler } from "../utils/async-handler.js"

const SQM_CONVERSION = {
    SQ_METER: 1,
    HECTARE: 10000,
    ACRE: 4046.86,
    BIGHA: 2529.29,
    GUNTHA: 101.17
};


export const getStates = asyncHandler(async (req, res) => {
    const states = await MasterLocation.find({ type: "STATE" }).select({
        code: 1,
        name: 1,
        default_area_unit: 1,
        _id: 0
    });

    return res
        .status(201)
        .json(new ApiResponse(true, { state_data: states }, "States fetched successfully"));
})

export const getDistricts = asyncHandler(async (req, res) => {
    const { state_code } = req.params;
    const districts = await MasterLocation.find({ type: "DISTRICT", parent_code: state_code }).select({
        code: 1,
        name: 1,
        default_area_unit: 1,
        _id: 0
    });

    return res
        .status(201)
        .json(new ApiResponse(true, { district_data: districts }, "Districts fetched successfully"));
})

export const getVillages = asyncHandler(async (req, res) => {
    const { district_code } = req.params;
    const villages = await MasterLocation.find({ type: "VILLAGE", parent_code: district_code }).select({
        code: 1,
        name: 1,
        default_area_unit: 1,
        _id: 0
    });

    return res
        .status(201)
        .json(new ApiResponse(true, { village_data: villages }, "Villages fetched successfully"));
})

export const convertArea = asyncHandler(async (req, res) => {
    const { area, from_unit, to_unit } = req.body;


    if (area === undefined || !from_unit || !to_unit) {
        throw new ApiError(400, "Missing required parameters: area, from_unit, to_unit");
    }

    const fromUnitConversion = SQM_CONVERSION[from_unit.toUpperCase()];
    const toUnitConversion = SQM_CONVERSION[to_unit.toUpperCase()];

    if (!fromUnitConversion || !toUnitConversion) {
        throw new ApiError(400, "Invalid unit provided. Supported units are: SQ_METER, HECTARE, ACRE, BIGHA, GUNTHA");
    }

    const convertedArea = (area * fromUnitConversion) / toUnitConversion;

    return res
        .status(201)
        .json(new ApiResponse(true, {
            original_value: Number(area),
            from_unit: from_unit.toUpperCase(),
            to_unit: to_unit.toUpperCase(),
            convertedArea: convertedArea
        }, "Area converted successfully"));
})


export const validateRecord = asyncHandler(async (req, res) => {

    const { state_code, district_code, village_code, area_unit } = req.body;
    const errors = [];

    if (state_code) {
        const stateExists = await MasterLocation.exists({
            code: state_code.toUpperCase(),
            type: "STATE"
        });
        if (!stateExists) errors.push(`State code '${state_code}' does not exist.`);
    }

    if (district_code) {
        const districtExists = await MasterLocation.exists({
            code: district_code.toUpperCase(),
            type: "DISTRICT"
        });
        if (!districtExists) errors.push(`District code '${district_code}' does not exist.`);
    }

    if (village_code) {
        const villageExists = await MasterLocation.exists({
            code: village_code.toUpperCase(),
            type: "VILLAGE"
        });
        if (!villageExists) errors.push(`Village code '${village_code}' does not exist.`);
    }

    if (area_unit && !SQM_CONVERSION[area_unit.toUpperCase()]) {
        errors.push(`Land area unit '${area_unit}' is invalid.`);
    }

    const isValid = errors.length === 0;

    return res
        .status(201)
        .json(new ApiResponse(true, { isValid, errors }, isValid ? "Record is valid." : "Record validation failed."))

})