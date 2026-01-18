'use client'


import { Anchor, Button, Center, Stack, Text, Title } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useEffect } from "react";
import { useBasket } from "../../../contexts/BasketContext";
import Cookies from "js-cookie";

export default function Completed() {
    const { updateBasket } = useBasket();

    useEffect(() => {
        async function updateBaset() {
            const username = JSON.parse(Cookies.get("user")).name;

            const baseUrl = window.location.origin;
            const basketResponse = await fetch(`https://headless.tebex.io/api/accounts/${process.env.NEXT_PUBLIC_TEBEX_TOKEN}/baskets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    cancel_url: `${baseUrl}/`,
                    complete_url: `${baseUrl}/completed`
                })
            })
                .then(res => res.json())
                .catch(err => {
                    console.log(err);
                    return JSON.stringify({
                        err: err,
                        status: 400
                    });
                });

            axios.get("/api/fetchUser?username=" + username).then((res) => {
                updateBasket(basketResponse);
                modals.closeAll();
            }).catch((err) => {
                console.log(err);
                notifications.show({
                    title: "Error!",
                    message: err.response.data.error,
                    styles: {
                        root: {
                            backgroundColor: "#eb525c",
                            boxShadow: "0px 2px 0px 1px #6e252a"
                        },
                        title: {
                            color: "#fff",
                            fontWeight: 700,
                        },
                        closeButton: {
                            color: "#fff",
                        },
                        description: {
                            color: "#fff",
                        }
                    }
                });
            });
        }
        Cookies.remove("basket");
        updateBaset();
    }, []);


    return (
        <Center mt="4rem" mb={{ base: "2rem", sm: "4rem", md: "12rem", lg: "24rem" }}>
            <Stack align="center">
                <Title order={2} c="bright" ta="center">Your purchase has been completed!</Title>
                <Text c="dimmed">Use the button below to go back to the store</Text>
                <Button component={Anchor} href="/" mt="1rem">Back to store</Button>
            </Stack>
        </Center>
    )
}