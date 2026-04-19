# Generated manually to add owner field to WorkerProfile

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('workers', '0002_workerprofile_workerschedule_delete_availability'),
    ]

    operations = [
        migrations.AddField(
            model_name='workerprofile',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                help_text='The owner who employs this worker',
                limit_choices_to={'role': 'owner'},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='workers',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
