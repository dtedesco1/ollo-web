import ClipComponent from '@/components/clip-component';

export default function ClipPage({ params }: { params: { clipId: string } }) {
    return <ClipComponent clipId={params.clipId} />;
}