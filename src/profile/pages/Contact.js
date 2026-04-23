import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

import { AuthContext } from '../../shared/context/auth-context';

import './Contact.css';

const CONTACT_EMAIL = 'forrestdev25@gmail.com';

const Contact = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        auth.showFooterHandler(false);
        return () => auth.showFooterHandler(true);
    }, [auth]);

    return (
        <div className='content contact-content'>
            <div className='contact-topbar'>
                <button
                    type='button'
                    className='icon-btn'
                    onClick={() => navigate('/profile')}
                    aria-label='Back to profile'
                >
                    <ArrowLeft size={22} strokeWidth={1.75} />
                </button>
            </div>

            <h1 className='contact-title'>Contact</h1>

            <p className='contact-intro'>
                Questions, comments, or requests? Reach out any time.
            </p>

            <a className='contact-email-card' href={`mailto:${CONTACT_EMAIL}`}>
                <Mail size={22} strokeWidth={1.75} />
                <span>{CONTACT_EMAIL}</span>
            </a>
        </div>
    );
};

export default Contact;
