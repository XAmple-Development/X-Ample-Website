'use client'

import { Combobox, Group, Input, Skeleton, Tooltip, useCombobox } from '@mantine/core';
import Image from "next/image";
import { useEffect, useState } from 'react';
import { getUserLocale, setUserLocale } from '../helpers/localManager';

export default function LanguageSwitcher({ settings }) {
    if (!settings.translation.settings.enabled) return null;

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const [value, setValue] = useState("");

    useEffect(() => {
        const fetchLocale = async () => {
            const locale = await getUserLocale();
            setValue(locale || "");
        };
        fetchLocale();
    }, []);

    const selectedOption = settings.translation.settings.languages.find((item) => item.key === value);

    const options = settings.translation.settings.languages.map((item) => (
        <Combobox.Option value={item.key} key={item.key}>
            <Tooltip zIndex={1000} label={item.value}>
                <Group pos="relative">
                    <Image src={item.flag} width={20} height={20} alt={item.flag.split(".")[0]} />
                </Group>
            </Tooltip>
        </Combobox.Option>
    ));

    const handleSwitch = (val) => {
        const newLanguageCode = settings.translation.settings.languages.find((item) => item.key === val).key;
        setUserLocale(newLanguageCode);
    };

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            zIndex={1000}
            withArrow={false}
            transitionProps={{ transition: "fade-down", duration: 100 }}
            classNames={{ dropdown: "language-switcher-dropdown" }}
            onOptionSubmit={(val) => {
                setValue(val);
                handleSwitch(val);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <Tooltip label="Change site language">
                    <Input
                        w="fit-content"
                        component="button"
                        size="md"
                        classNames={{ input: "language-switcher" }}
                        radius={4}
                        pointer
                        onClick={() => combobox.toggleDropdown()}
                        rightSectionPointerEvents="none"
                    >
                        {selectedOption ? (
                            <Group>
                                <Image src={selectedOption.flag} width={20} height={20} alt={selectedOption.flag.split(".")[0]} />
                            </Group>
                        ) : (
                            <Skeleton circle h={20} w={20} />
                        )}
                    </Input>
                </Tooltip>
            </Combobox.Target>

            <Combobox.Dropdown bg="dark.9">
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}