import type {ReactElement} from 'react';
export interface FileTriggerProps { children: ReactElement; acceptedFileTypes?: readonly string[]; onSelect?: (files: FileList | null) => void; }
export declare function FileTrigger(props: FileTriggerProps): ReactElement;
