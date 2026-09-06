import {DEVELOPER_PACING_PROFILE,NORMAL_PACING_PROFILE} from '../src/game/domain/WorkdayPacing';
import {BALANCE_MATRIX,REPRESENTATIVE_POLICIES,runWorkdaySimulation} from '../src/game/domain/WorkdaySimulation';
const profiles=[NORMAL_PACING_PROFILE,DEVELOPER_PACING_PROFILE] as const;
const reports=profiles.flatMap(profile=>BALANCE_MATRIX.map(({seed,policy})=>runWorkdaySimulation({profile,seed,policy:REPRESENTATIVE_POLICIES[policy as keyof typeof REPRESENTATIVE_POLICIES]})));
process.stdout.write(`${JSON.stringify(reports,null,2)}\n`);
