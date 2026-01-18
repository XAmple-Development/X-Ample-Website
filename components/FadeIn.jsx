'use client'

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FadeIn({ children }) {
    const [key, setKey] = useState(0);
    const router = useRouter();

    useEffect(() => {
        setKey(prevKey => prevKey + 1);
    }, [router.asPath]);

    return (
        <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {children}
        </motion.div>
    );
}