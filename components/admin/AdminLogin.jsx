'use client'

import { Button, Card, Container, PasswordInput, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { notifications } from "@mantine/notifications";

export default function AdminLogin() {
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_IS_DEMO === "true" ? "demo" : "");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Login failed');
      }
      notifications.show({ color: 'green', title: 'Success', message: 'Logged in' });
      window.location.reload();
    } catch (e) {
      notifications.show({ color: 'red', title: 'Error', message: e.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={500}>
      <Card bg="background_alt" p="1rem">
        <Stack>
          <Text>Please enter the admin password.</Text>
          <PasswordInput value={password} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="Password" size="md" />
          <Button loading={loading} onClick={submit} size="md">Login</Button>
        </Stack>
      </Card>
    </Container>
  );
}


