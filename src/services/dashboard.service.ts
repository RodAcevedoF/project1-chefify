import { UserRepository } from '../repositories';

export const DashboardService = {
	async getRecentOperations(limit?: number) {
		const ops = await UserRepository.findOperations();
		if (typeof limit === 'number' && limit > 0) return ops.slice(0, limit);
		return ops;
	},
};

export default DashboardService;
