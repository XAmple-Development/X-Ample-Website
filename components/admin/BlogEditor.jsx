'use client'

import { useEffect, useState } from 'react';
import { Button, Group, Stack, TextInput, Textarea } from '@mantine/core';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRouter } from 'next/navigation';
import { DatePickerInput } from '@mantine/dates';

export default function BlogEditor({ initialPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [featureImage, setFeatureImage] = useState(initialPost?.feature_image || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [publishedAt, setPublishedAt] = useState(initialPost?.published_at || new Date());
  const [html, setHtml] = useState(initialPost?.html || '');
  const editor = useEditor({ extensions: [StarterKit], content: html, onUpdate: ({ editor }) => setHtml(editor.getHTML()) });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const body = {
      title,
      slug,
      feature_image: featureImage,
      excerpt,
      published_at: publishedAt,
      html
    };
    const method = initialPost ? 'PUT' : 'POST';
    const url = initialPost ? `/api/admin/blogs/${initialPost.slug}` : '/api/admin/blogs';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) router.push('/admin?tab=blog');
  };

  return (
    <Stack>
      <Group grow>
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} />
      </Group>
      <TextInput label="Feature Image URL" value={featureImage} onChange={(e) => setFeatureImage(e.currentTarget.value)} />
      <DatePickerInput label="Published At" value={publishedAt} onChange={(val) => setPublishedAt(val)} placeholder="YYYY-MM-DDTHH:mm:ss.sssZ" />
      <Textarea label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.currentTarget.value)} minRows={3} />
      <RichTextEditor>
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content editor={editor} />
      </RichTextEditor>
      <Group justify="flex-end">
        <Button loading={saving} onClick={save}>Save</Button>
      </Group>
    </Stack>
  );
}


