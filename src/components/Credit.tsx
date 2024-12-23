/**
 * Miata Registry
 * Copyright (C) 2024 Matthew Congrove
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCar } from '@fortawesome/free-solid-svg-icons';

interface CreditProps {
    owner: string;
    car: string;
    number?: string;
    id: string;
    direction?: 'left' | 'right';
}

export const Credit = ({
    id,
    owner,
    car,
    number,
    direction = 'right',
}: CreditProps) => {
    return (
        <a href={`#${id}`} className="group">
            <div className="relative">
                <div
                    className={`bg-white/70 flex items-center justify-center p-3 ${
                        direction === 'left'
                            ? 'rounded-full group-hover:rounded-r-full group-hover:rounded-l-none'
                            : 'rounded-full group-hover:rounded-l-full group-hover:rounded-r-none'
                    } transition-all duration-300 relative z-10`}
                >
                    <FontAwesomeIcon
                        icon={faCar}
                        className={`w-4 h-4 text-brg`}
                    />
                </div>

                <div
                    className={`absolute ${
                        direction === 'left' ? 'right-full' : 'left-full'
                    } top-0 h-full bg-white/70 ${
                        direction === 'left'
                            ? 'rounded-l-full'
                            : 'rounded-r-full'
                    } opacity-0 group-hover:opacity-100 ${
                        direction === 'left'
                            ? 'translate-x-2 group-hover:translate-x-0'
                            : '-translate-x-2 group-hover:translate-x-0'
                    } transition-all duration-300 delay-0 group-hover:delay-[100ms] pointer-events-none overflow-hidden whitespace-nowrap`}
                >
                    <div
                        className={`h-full flex flex-col text-brg justify-center py-2 ${direction === 'left' ? 'pl-4' : 'pr-4'} text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-0 group-hover:delay-[200ms]`}
                    >
                        <p>
                            {car}
                            {number && ` #${number}`}
                        </p>
                        <p>{owner}</p>
                    </div>
                </div>
            </div>
        </a>
    );
};
