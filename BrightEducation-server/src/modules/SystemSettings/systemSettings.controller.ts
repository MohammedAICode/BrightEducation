import { Request, Response } from 'express';
import { getSystemSettings, updateSystemSettings } from './systemSettings.service';
import { AppError } from '../../config/Error/AppError';

interface ApiResponse {
  error: boolean;
  body: any;
  message: string;
}

export async function getSystemSettingsHandler(req: Request, res: Response) {
  try {
    const settings = await getSystemSettings();

    const response: ApiResponse = {
      error: false,
      body: settings,
      message: 'System settings fetched successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to fetch system settings',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}

export async function updateSystemSettingsHandler(req: Request, res: Response) {
  try {
    // Only admin can update system settings
    if (!req.user || req.user.role !== 'ADMIN') {
      const response: ApiResponse = {
        error: true,
        body: null,
        message: 'Only administrators can update system settings',
      };
      return res.status(403).json(response);
    }

    const { timezone, testModeEnabled, testDate } = req.body;

    const settings = await updateSystemSettings({
      timezone,
      testModeEnabled,
      testDate: testDate ? new Date(testDate) : null,
    });

    const response: ApiResponse = {
      error: false,
      body: settings,
      message: 'System settings updated successfully',
    };
    return res.status(200).json(response);
  } catch (error: any) {
    const response: ApiResponse = {
      error: true,
      body: null,
      message: error.message || 'Failed to update system settings',
    };
    return res.status(error.statusCode || 500).json(response);
  }
}
