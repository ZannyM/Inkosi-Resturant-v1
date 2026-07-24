import React, { useContext, useEffect } from 'react';
import "./Verify.css";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");

    //getting the backend url from context api
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        if (!orderId || success === null) {
            navigate("/checkout", {
                replace: true,
                state: { paymentFailed: true, message: "Invalid payment verification details." }
            });
            return;
        }

        try {
            const response = await axios.post(url + "/api/order/verify", { success, orderId });
            if (response.data.success) {
                navigate(`/confirmation?orderId=${encodeURIComponent(orderId)}`, {
                    replace: true
                });
            } else {
                navigate("/checkout", {
                    replace: true,
                    state: {
                        paymentFailed: true,
                        message: response.data.message || "Payment was not completed."
                    }
                });
            }
        } catch (error) {
            navigate("/checkout", {
                replace: true,
                state: {
                    paymentFailed: true,
                    message: "We could not verify your payment. Please contact support if you were charged."
                }
            });
        }
    };

    useEffect(() => {
        verifyPayment();
    }, []);


    return (
        <div className='verify'>
            <div className="spinner">

            </div>

        </div>
    );
};

export default Verify;
