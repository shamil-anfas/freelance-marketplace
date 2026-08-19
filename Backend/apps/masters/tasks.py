import time

from celery import shared_task


@shared_task
def print_message():
    time.sleep(5)
    print("Hello from a Celery task!")
