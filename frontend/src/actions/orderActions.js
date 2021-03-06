import Axios from 'axios';
import { CART_EMPTY } from '../constants/cartConstants';
import { ORDER_CREATE_FAIL, 
    ORDER_CREATE_REQUEST, 
    ORDER_CREATE_SUCCESS, 
    ORDER_DETAILS_FAIL, 
    ORDER_DETAILS_REQUEST, 
    ORDER_DETAILS_SUCCESS, 
    ORDER_MINE_LIST_FAIL, 
    ORDER_MINE_LIST_REQUEST, 
    ORDER_MINE_LIST_SUCCESS, 
    ORDER_PAY_FAIL, 
    ORDER_PAY_REQUEST,
    ORDER_PAY_SUCCESS} from "../constants/orderConstants"

export const createOrder = (order) => async (dispatch, getState) => {
    dispatch({
        type: ORDER_CREATE_REQUEST,
        payload: order
    });
    try {
        //get userInfo from redux store
        const { userSignin: { userInfo }} = getState() // getState returns the whole redux store for us
        const { data } = await Axios.post('/api/orders', order, {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        })
        dispatch({
            type: ORDER_CREATE_SUCCESS,
            payload: data.order,
        });
        dispatch({
            type: CART_EMPTY,
        });
        localStorage.removeItem('cartItems');
    } catch (error) {
        dispatch({
            type: ORDER_CREATE_FAIL,
            payload: error.response && error.response.data.message?
            error.response.data.message : error.message,
        })
        
    }
}

//define detailsOrder function
export const detailsOrder = (orderId) => async (dispatch, getState) => {
    dispatch({
        type: ORDER_DETAILS_REQUEST,
        payload: orderId
    });
    const { userSignin: { userInfo }, } = getState()
    try {
        const { data } = await Axios.get(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${userInfo.token}`}
        });

        dispatch({
            type: ORDER_DETAILS_SUCCESS,
            payload: data
        })
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({
            type: ORDER_DETAILS_FAIL,
            payload: message
        })
        
    }
}

//pay order action
export const payOrder = async (order, paymentResult) => (dispatch, getState) =>{
    dispatch({
        type: ORDER_PAY_REQUEST,
        payload: {order, paymentResult}
    });
    //get user info
    const { userSignin: { userInfo }, } = getState();
    try {
        const { data } = Axios.put(`/api/orders/${order._id}/pay`, paymentResult, {
            headers: { Authorization: `Bearer ${userInfo.token}`},
        });
        dispatch({
            type: ORDER_PAY_SUCCESS,
            payload: data
        })
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({
            type: ORDER_PAY_FAIL,
            payload: message
        })
        
    }
}


//ACTION FOR ORDER HISTORY
//return my orders
export const listOrderMine = () =>async(dispatch, getState) =>{
    dispatch({
        type: ORDER_MINE_LIST_REQUEST
    })
//get userInfo
    const { userSignin: { userInfo }} = getState();
    try {
        const { data } = await Axios.get('/api/orders/mine', {
            headers: {
                Authorization: `Bearer ${userInfo.token}`
            }
        });
        dispatch({
            type: ORDER_MINE_LIST_SUCCESS,
            payload: data
        })
        
    } catch (error) {
        const message = error.response && error.response.data.message?
        error.response.data.message : error.message;
        dispatch({type: ORDER_MINE_LIST_FAIL, payload: message})
    }
}