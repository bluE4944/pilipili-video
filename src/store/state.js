import { Loading } from 'element-ui';
import * as types from './mutation-types';

const state={
    showLoading: true,
    isPc: true,
    loadingInstance: Loading.service(types.LOADIBG_OPTIONS)
}

export default state;