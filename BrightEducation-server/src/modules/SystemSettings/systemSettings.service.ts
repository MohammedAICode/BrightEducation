import { prisma } from '../../libs/prisma';
import { AppError } from '../../config/Error/AppError';

export const getSystemSettings = async () => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    // Auto-create if not exists
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          timezone: 'Asia/Kolkata',
          testModeEnabled: false,
        },
      });
    }

    return settings;
  } catch (error) {
    throw new AppError('Failed to fetch system settings', 500);
  }
};

export const updateSystemSettings = async (data: {
  timezone?: string;
  testModeEnabled?: boolean;
  testDate?: Date | null;
}) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Create if not exists
      settings = await prisma.systemSettings.create({
        data: {
          timezone: data.timezone || 'Asia/Kolkata',
          testModeEnabled: data.testModeEnabled || false,
          testDate: data.testDate,
        },
      });
    } else {
      // Update existing
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data,
      });
    }

    return settings;
  } catch (error) {
    throw new AppError('Failed to update system settings', 500);
  }
};
