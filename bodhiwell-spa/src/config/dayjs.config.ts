
import dayjs from 'dayjs';

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/es';

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);
dayjs.locale('es');
