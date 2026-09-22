import { LandRateSchedule } from "../models/landRateSchedule.models.js"
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";

export const getLandRates = asyncHandler(async (req, res) => {
    const district_code = req.params.district_code;
    const landRates = await LandRateSchedule.find({ district_code }).select({
        land_type: 1,
        circle_rate_per_unit: 1,
        unit: 1,
        effective_from: 1,
        _id: 0
    });

    return res
        .status(201)
        .json(new ApiResponse(true, { land_rates: landRates }, "Land rates fetched successfully"));
})

