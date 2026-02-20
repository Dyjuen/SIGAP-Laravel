import React from 'react';
import KakForm from './Form';

export default function KakShow(props) {
    return (
        <KakForm {...props} readOnly={true} />
    );
}
