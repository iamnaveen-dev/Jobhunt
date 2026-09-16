from .ai_service import generate_embedding, cosine_similarity
from apps.jobs.models import Job
from apps.jobs.serializers import JobListSerializer


def semantic_job_search(query, limit=10):
    query_embedding = generate_embedding(query)

    if not query_embedding:
        return [], {}

    jobs = Job.objects.filter(
        is_active=True
    ).exclude(
        embedding__isnull=True
    ).select_related(
        'recruiter__recruiter_profile'
    ).prefetch_related('skills_required')

    job_scores = []
    for job in jobs:
        if job.embedding:
            similarity = cosine_similarity(
                query_embedding,
                job.embedding
            )
            job_scores.append((job, similarity))

    job_scores.sort(key=lambda x: x[1], reverse=True)

    top_jobs = [job for job, score in job_scores[:limit]]
    scores = {
        job.id: round(score * 100, 1)
        for job, score in job_scores[:limit]
    }

    return top_jobs, scores


def generate_job_embedding(job):
    text = f"{job.title} {job.description}"
    embedding = generate_embedding(text)
    if embedding:
        job.embedding = embedding
        job.save()
    return embedding