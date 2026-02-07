import { useState } from 'react';
import { useVisits } from '@/hooks/useVisits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface VisitFormProps {
  propertyId: string;
  ownerId: string;
  onClose: () => void;
}

export function VisitForm({ propertyId, ownerId, onClose }: VisitFormProps) {
  const { requestVisit } = useVisits();
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestVisit.mutateAsync({
        property_id: propertyId,
        owner_id: ownerId,
        proposed_date: new Date(date).toISOString(),
        message: message || undefined,
      });
      toast.success('Demande de visite envoyée');
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="p-4 mt-4">
      <h3 className="font-semibold mb-3">Demander une visite</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><Label>Date et heure souhaitées</Label><Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required /></div>
        <div><Label>Message (optionnel)</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder="Un message pour le propriétaire..." /></div>
        <div className="flex gap-2">
          <Button type="submit" disabled={requestVisit.isPending} className="flex-1">{requestVisit.isPending ? 'Envoi...' : 'Envoyer'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </form>
    </Card>
  );
}
