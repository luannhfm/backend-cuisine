import { homepageRepository } from '../repositories/homepage.repository';
import { HomepageConfig } from '../entities/homepage.entity';

export class HomepageService {
  static async getConfig(): Promise<HomepageConfig | null> {
    return await homepageRepository.findOne({ where: {} });
  }

  static async updateConfig(data: Partial<HomepageConfig>): Promise<HomepageConfig> {
    const existing = await homepageRepository.findOne({ where: {} });

    if (existing) {
      homepageRepository.merge(existing, data);
      return await homepageRepository.save(existing);
    } else {
      const created = homepageRepository.create(data);
      return await homepageRepository.save(created);
    }
  }
}
