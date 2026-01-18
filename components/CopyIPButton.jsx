'use client';

import { useState } from 'react';
import { Group, Text } from '@mantine/core';
import { BiCopy, BiCheck } from 'react-icons/bi';

export default function CopyIPButton({ copiedIpText, copyIpText, settings }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(settings.server.settings.server_ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
  };

  return (
    <Group visibleFrom="md" className="pointer" onClick={handleCopy}>
      {copied ? <BiCheck color="#fff" size="3.4rem" /> : <BiCopy color="#fff" size="3.4rem" />}
      <div>
        <Text fz="1.4rem" fw={700} c="bright" tt="uppercase">{settings.server.settings.server_ip}</Text>
        <Text fw={600} c={copied ? "green.5" : "green.5"}>
          {copied ? copiedIpText : copyIpText}
        </Text>
      </div>
    </Group>
  );
}
