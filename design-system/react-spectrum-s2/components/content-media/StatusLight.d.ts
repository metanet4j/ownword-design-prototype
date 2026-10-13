import type {ReactElement, ReactNode} from 'react';
export interface StatusLightProps { children?: ReactNode; variant?: 'neutral' | 'positive' | 'notice' | 'negative' | 'informative'; role?: 'status'; }
export declare function StatusLight(props: StatusLightProps): ReactElement;
